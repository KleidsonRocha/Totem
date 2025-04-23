from pynput import keyboard
import requests
import threading

# Endpoint HTTP que será chamado
ENDPOINT_URL = "http://192.168.10.35:9000/imprimir_atendimento"

# Variável de estado
tecla_i_detectada = False
lock = threading.Lock()  # Para evitar condições de corrida

# Função para lidar com a tecla "i" pressionada
def on_press(key):
    global tecla_i_detectada
    with lock:
        try:
            if key.char == 'i':
                print('Tecla "i" detectada')
                # Executar a ação desejada aqui
                try:
                    response = requests.post(ENDPOINT_URL)  # Envia uma requisição POST sem dados
                    response.raise_for_status()  # Lança uma exceção para status de erro
                    print(f'Endpoint chamado com sucesso. Status: {response.status_code}')
                except requests.exceptions.RequestException as e:
                    print(f'Erro ao chamar o endpoint: {e}')

        except AttributeError:
            pass

# Configurar o listener do teclado
def main():
    with keyboard.Listener(on_press=on_press) as keyboard_listener:
        keyboard_listener.join()

if __name__ == "__main__":
    main()