from channels.generic.websocket import WebsocketConsumer
import json

class GameConsumer(WebsocketConsumer):
    def connect(self):
        # Accept the connection
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        # Handle messages from the frontend
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message back
        self.send(text_data=json.dumps({
            'message': message
        }))
