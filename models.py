import random

class Ship:
    def __init__(self, name, size, positions=None):
        self.name = name
        self.size = size
        self.positions = positions or []

    def place_ship(self, board, start, direction):
        # Lógica para posicionar o navio no tabuleiro
        pass

class Board:
    def __init__(self):
        self.size = 5
        self.grid = [['water' for _ in range(self.size)] for _ in range(self.size)]
        self.ships = {
            'submarino': [Ship('Submarino', 1) for _ in range(3)],
            'barco': [Ship('Barco', 2)],
            'navio': [Ship('Navio', 3) for _ in range(2)],
            'porta_aviao': [Ship('Porta Aviao', 3, 3)]
        }

    def place_all_ships(self):
        # Lógica para colocar todos os navios no tabuleiro
        pass

    def hit(self, x, y):
        # Lógica para verificar se um tiro acerta um navio
        pass
