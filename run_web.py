import os
import sys
import subprocess
import time
import webbrowser
import threading

def print_banner():
    banner = """
    ===================================================
    🤖  Automated Job Application Software (Web Interface)
    ===================================================
    [+] Theme: Sleek Obsidian & Slate
    [+] Stack: FastAPI + React / Vite
    [+] Status: Preparing environment...
    """
    print(banner)

def check_and_install_dependencies():
    print("[*] Verifying Python dependencies...")
    try:
        import fastapi
        import uvicorn
        import multipart
        print("[+] All dependencies present.")
    except ImportError:
        print("[-] Missing required libraries. Installing via requirements.txt...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("[+] Installation successful.")
        except Exception as e:
            print(f"[!] Error installing dependencies: {e}")
            print("[!] Attempting direct installation of core server libraries...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn", "python-multipart"])

def open_browser():
    # Wait 2 seconds for uvicorn server to spin up
    time.sleep(2.0)
    url = "http://127.0.0.1:8000"
    print(f"\n[+] Opening web interface at: {url}")
    webbrowser.open(url)

def main():
    print_banner()
    
    # 1. Check Python packages
    check_and_install_dependencies()
    
    # 2. Check if frontend has been built. If not, alert
    frontend_dist = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')
    if not os.path.exists(os.path.join(frontend_dist, 'index.html')):
        print("\n[!] WARNING: Frontend build folder 'frontend/dist' not found.")
        print("[!] The server will serve a loading placeholder page until you run 'npm run build' inside 'frontend/'.")
    
    # 3. Start thread to open default browser
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # 4. Start Uvicorn FastAPI Server
    print("\n[*] Starting FastAPI Backend Daemon...")
    try:
        import uvicorn
        uvicorn.run("src.server:app", host="127.0.0.1", port=8000, reload=False)
    except KeyboardInterrupt:
        print("\n[+] Server stopped gracefully by user.")
    except Exception as e:
        print(f"\n[!] Server failed to start: {e}")

if __name__ == '__main__':
    main()
