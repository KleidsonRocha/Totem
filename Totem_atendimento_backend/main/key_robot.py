from pynput import keyboard
import requests
import threading
import time   # <-- adicione essa linha

ENDPOINT_URL = "http://192.168.10.57:9000/imprimir_atendimento"

lock = threading.Lock()

def on_press(key):
    with lock:
        try:
            if key.char == 'A':
                print('Tecla "A" detectada')
                # Ação desejada
                try:
                    response = requests.post(ENDPOINT_URL)
                    response.raise_for_status()
                    print(f'Endpoint chamado com sucesso. Status: {response.status_code}')
                except requests.exceptions.RequestException as e:
                    print(f'Erro ao chamar o endpoint: {e}')
                time.sleep(3)  # <--- Delay de 3 segundos aqui

            if key.char == 'B':
                print('Tecla "B" detectada')
                # Ação desejada
                try:
                    response = requests.post(ENDPOINT_URL)
                    response.raise_for_status()
                    print(f'Endpoint chamado com sucesso. Status: {response.status_code}')
                except requests.exceptions.RequestException as e:
                    print(f'Erro ao chamar o endpoint: {e}')
                time.sleep(3)  # <--- Delay de 3 segundos aqui também

        except AttributeError:
            pass

def main():
    with keyboard.Listener(on_press=on_press) as keyboard_listener:
        keyboard_listener.join()

if __name__ == "__main__":
    main()