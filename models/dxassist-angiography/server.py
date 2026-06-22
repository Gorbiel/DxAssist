# mocked angiography model
import socket
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format='[%(name)s] %(message)s'
)
logger = logging.getLogger('angiography')

class AngiographyModel:
    def __init__(self):
        self.host = '0.0.0.0'
        self.port = 8002
        
    def process(self, data: dict) -> dict:
        logger.info("Received data from scheduler")
        
        result = {
            "coronary_disease_probability": 98
        }
        
        logger.info(f"Returning result: {result}")
        return result
    
    def start(self):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
            server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_socket.bind((self.host, self.port))
            server_socket.listen(5)
            
            logger.info(f"Angiography model started on {self.host}:{self.port}")
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
                    logger.info("Shutting down angiography model...")
                    break
                except Exception as e:
                    logger.error(f"Error handling request: {e}")

if __name__ == '__main__':
    model = AngiographyModel()
    model.start()