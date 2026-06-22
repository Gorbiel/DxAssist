import socket
import json
import yaml
import logging
from typing import Dict, Any

logging.basicConfig(
    level=logging.INFO,
    format='[%(name)s] %(message)s'
)
logger = logging.getLogger('scheduler')

class Scheduler:
    def __init__(self, config_path: str = 'config.yaml'):
        self.config = self.load_config(config_path)
        self.host = '0.0.0.0'
        self.port = 8001
        
    def load_config(self, path: str) -> Dict:
        with open(path, 'r') as f:
            config = yaml.safe_load(f)
        logger.info(f"Configuration loaded from {path}")
        return config
    
    def send_to_model(self, host: str, port: int, data: Dict) -> Dict:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.connect((host, port))
                
                message = json.dumps(data).encode('utf-8')
                sock.sendall(message + b'\n')
                
                response = b''
                while True:
                    chunk = sock.recv(4096)
                    if not chunk:
                        break
                    response += chunk
                    if b'\n' in chunk:
                        break
                
                return json.loads(response.decode('utf-8'))
        except Exception as e:
            logger.error(f"Error communicating with model at {host}:{port}: {e}")
            raise
    
    def handle_single_mode(self, model_name: str, data: Dict) -> Dict:
        logger.info(f"Processing SINGLE mode request for model: {model_name}")
        
        model_config = self.config.get(model_name)
        if not model_config:
            raise ValueError(f"Unknown model: {model_name}")
        
        host = model_config.get('host', model_name)
        port = model_config.get('port')
        
        if not port:
            raise ValueError(f"Port not configured for model: {model_name}")
        
        logger.info(f"Forwarding to {model_name} at {host}:{port}")
        response = self.send_to_model(host, port, data)
        logger.info(f"Received response from {model_name}")
        
        return response
    
    def handle_combined_mode(self, combined_model_name: str, initial_data: Dict, client_socket) -> Dict:

        logger.info(f"Processing COMBINED mode request for: {combined_model_name}")

        combined_config = self.config.get(combined_model_name)
        if not combined_config:
            raise ValueError(f"Unknown combined model: {combined_model_name}")

        models_config = combined_config.get("models", {})
        if not models_config:
            raise ValueError(f"No models configured for {combined_model_name}")

        logger.info(f"Combined model uses: {list(models_config.keys())}")

        model_results = {}
        model_weights = {}
        model_list = list(models_config.items())
        
        for idx, (model_name, weight) in enumerate(model_list):
            model_config = self.config.get(model_name)

            if not model_config:
                logger.error(f"Model {model_name} not found in config")
                continue

            host = model_config.get("host", model_name)
            port = model_config.get("port")

            if not port:
                logger.error(f"Port not configured for model: {model_name}")
                continue

            if idx == 0:
                current_data = initial_data
            else:
                logger.info(f"Requesting data for model {idx + 1}/{len(model_list)}: {model_name}")
                request_msg = {
                    "status": "partial",
                    "message": f"Please provide data for {model_name}",
                    "model_index": idx + 1,
                    "total_models": len(model_list),
                    "current_model": model_name,
                    "previous_results": model_results
                }
                
                request_data = json.dumps(request_msg).encode('utf-8')
                client_socket.sendall(request_data + b'\n')
                logger.info(f"Sent request for next data to client")
                
                data_buffer = b''
                while True:
                    chunk = client_socket.recv(4096)
                    if not chunk:
                        raise ConnectionError("Client disconnected while waiting for next data")
                    data_buffer += chunk
                    if b'\n' in chunk:
                        break
                
                next_request = json.loads(data_buffer.decode('utf-8'))
                current_data = next_request.get('data', {})
                logger.info(f"Received data for {model_name} from client")

            logger.info(
                f"Forwarding to {model_name} at {host}:{port} "
                f"(weight={weight}, model {idx + 1}/{len(model_list)})"
            )

            try:
                response = self.send_to_model(host, port, current_data)

                logger.info(
                    f"Received response from {model_name}: {response}"
                )

                model_results[model_name] = response
                model_weights[model_name] = weight

            except Exception as e:
                logger.error(
                    f"Failed to get response from {model_name}: {e}"
                )

        if not model_results:
            raise RuntimeError(
                "No model responses received for combined inference"
            )

        common_numeric_fields = None

        for response in model_results.values():
            numeric_fields = {
                key
                for key, value in response.items()
                if isinstance(value, (int, float))
            }

            if common_numeric_fields is None:
                common_numeric_fields = numeric_fields
            else:
                common_numeric_fields &= numeric_fields

        common_numeric_fields = common_numeric_fields or set()

        logger.info(
            f"Common numeric fields found: "
            f"{list(common_numeric_fields)}"
        )

        aggregated = {}

        for field in common_numeric_fields:
            weighted_sum = 0.0

            for model_name, response in model_results.items():
                weight = model_weights[model_name]
                weighted_sum += response[field] * weight

            aggregated[field] = round(weighted_sum, 2)

        result = {
            "aggregated": aggregated,
            "details": model_results,
            "weights": model_weights,
            "combined_model": combined_model_name,
        }

        logger.info(
            f"Combined result calculated. "
            f"Aggregated fields: {aggregated}"
        )

        return result
    
    def handle_request(self, request: Dict, client_socket=None) -> Dict:
        mode = request.get('mode')
        model = request.get('model')
        data = request.get('data', {})
        
        if not model:
            raise ValueError("Model name is required")
        
        model_config = self.config.get(model)
        if not model_config:
            raise ValueError(f"Unknown model: {model}")
        
        model_type = model_config.get('type')
        
        if model_type == 'combined':
            if not client_socket:
                raise ValueError("Client socket required for combined mode")
            return self.handle_combined_mode(model, data, client_socket)
        else:
            return self.handle_single_mode(model, data)
    
    def start(self):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
            server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_socket.bind((self.host, self.port))
            server_socket.listen(5)
            
            logger.info(f"Scheduler started on {self.host}:{self.port}")
            logger.info("Waiting for connections...")
            
            while True:
                try:
                    client_socket, address = server_socket.accept()
                    logger.info(f"Connection from {address}")
                    
                    with client_socket:
                        data = b''
                        while True:
                            chunk = client_socket.recv(4096)
                            if not chunk:
                                break
                            data += chunk
                            if b'\n' in chunk:
                                break
                        
                        if data:
                            request = json.loads(data.decode('utf-8'))
                            logger.info(f"Received request: model={request.get('model')}")
                            
                            response = self.handle_request(request, client_socket)
                            
                            response_data = json.dumps(response).encode('utf-8')
                            client_socket.sendall(response_data + b'\n')
                            logger.info("Final response sent to client")
                            
                except KeyboardInterrupt:
                    logger.info("Shutting down scheduler...")
                    break
                except Exception as e:
                    logger.error(f"Error handling request: {e}")

if __name__ == '__main__':
    scheduler = Scheduler()
    scheduler.start()