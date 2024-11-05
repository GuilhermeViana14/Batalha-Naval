import random
import uuid

class Game:
    def __init__(self):
        self.players = [None, None]
        self.current_player = 0
        self.boards = [{'board': [[0] * 5 for _ in range(5)], 'ships': []},
                       {'board': [[0] * 5 for _ in range(5)], 'ships': []}]
        self.ships = {
            'submarino': {'size': 1, 'count': 3},
            'barco': {'size': 2, 'count': 1},
            'navio': {'size': 3, 'count': 2},
            'porta_aviao': {'size': 3, 'count': 1}
        }
        self.game_started = False

    def add_player(self, player_id=None):
        if player_id is None:
            player_id = str(uuid.uuid4())
        
        if self.players[0] is None:
            self.players[0] = player_id
            return "Jogador 1 adicionado"
        elif self.players[1] is None:
            self.players[1] = player_id
            return "Jogador 2 adicionado"
        else:
            return "Máximo de jogadores atingido"

    def start_game(self):
        if self.players[0] is not None and self.players[1] is not None:
            self.game_started = True
            self.place_ships(0)
            self.place_ships(1)
            return "Jogo iniciado"
        else:
            return "Necessário dois jogadores para iniciar o jogo"

    def is_game_started(self):
        return self.game_started

    def place_ships(self, player_index):
        for ship_name, ship_info in self.ships.items():
            for _ in range(ship_info['count']):
                self.place_ship(ship_info['size'], player_index)

    def place_ship(self, size, player_index):
        placed = False
        board = self.boards[player_index]['board']
        while not placed:
            orientation = random.choice(['horizontal', 'vertical'])
            if orientation == 'horizontal':
                x = random.randint(0, 4)
                y = random.randint(0, 5 - size)
            else:
                x = random.randint(0, 5 - size)
                y = random.randint(0, 4)

            if self.can_place_ship(x, y, size, orientation, board):
                for i in range(size):
                    if orientation == 'horizontal':
                        board[x][y + i] = 1
                    else:
                        board[x + i][y] = 1
                self.boards[player_index]['ships'].append((x, y, size, orientation))
                placed = True

    def can_place_ship(self, x, y, size, orientation, board):
        for i in range(size):
            if orientation == 'horizontal':
                if board[x][y + i] != 0:
                    return False
            else:
                if board[x + i][y] != 0:
                    return False
        return True

    def make_move(self, player_id, x, y):
        if not self.is_game_started():
            return {'hit': False, 'message': 'O jogo não começou ainda.', 'boards': self.boards}

        current_player_id = self.get_current_player()
        if player_id != current_player_id:
            return {'hit': False, 'message': 'É a vez do outro jogador.', 'boards': self.boards}

        opponent_index = 1 if self.current_player == 0 else 0
        board = self.boards[opponent_index]['board']
        
        if board[x][y] == 1:
            board[x][y] = 2
            if self.check_winner(opponent_index):
                return {'hit': True, 'message': 'Acertou! Você venceu!', 'winner': self.players[self.current_player], 'x': x, 'y': y, 'boards': self.boards}
            result = {'hit': True, 'message': 'Acertou!', 'x': x, 'y': y, 'boards': self.boards}
        else:
            result = {'hit': False, 'message': 'Errou!', 'x': x, 'y': y, 'boards': self.boards}

        self.switch_player()
        return result

    def check_winner(self, opponent_index):
        for row in self.boards[opponent_index]['board']:
            if 1 in row:
                return False
        return True

    def switch_player(self):
        self.current_player = 1 if self.current_player == 0 else 0

    def get_current_player(self):
        return self.players[self.current_player]
