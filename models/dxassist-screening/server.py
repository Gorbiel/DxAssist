# mocked screening model
import socket
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format='[%(name)s] %(message)s'
)
logger = logging.getLogger('screening')

class ScreeningModel:
    def __init__(self):
        self.host = '127.0.0.1'
        self.port = 8003
        
    def process(self, data: dict) -> dict:
        logger.info("Processing blood data from scheduler")
        
        result = {
            "coronary_disease_probability": 72,
            "ldl_cholesterol": "elevated",
            "hs_crp": "elevated"
        }
        
        logger.info(f"Returning result: {result}")
        return result
    
    def start(self):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
            server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_socket.bind((self.host, self.port))
            server_socket.listen(5)
            
            logger.info(f"Screening model started on {self.host}:{self.port}")
            logger.info("Waiting for connections...")
            
            while True:
                try:
                    client_socket, address = server_socket.accept()
                    
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
                            
                            response = self.process(request)
                            
                            response_data = json.dumps(response).encode('utf-8')
                            client_socket.sendall(response_data + b'\n')
                            
                except KeyboardInterrupt:
                    logger.info("Shutting down screening model...")
                    break
                except Exception as e:
                    logger.error(f"Error handling request: {e}")

if __name__ == '__main__':
    model = ScreeningModel()
    model.start()