from fastapi import FastAPI, WebSocket
from models import Board

app = FastAPI()
board = Board()
board.place_all_ships()

@app.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        x, y = map(int, data.split(','))
        result = board.hit(x, y)
        await websocket.send_text(result)
