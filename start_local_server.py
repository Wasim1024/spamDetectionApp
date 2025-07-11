#!/usr/bin/env python3
"""
Simple script to run the FastAPI backend locally
"""
import sys
import os
import subprocess

def main():
    # Change to the project directory
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)
    
    print("🚀 Starting FastAPI backend server...")
    print(f"📁 Working directory: {project_dir}")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📋 API Documentation: http://localhost:8000/docs")
    print("\n" + "="*50)
    
    try:
        # Run uvicorn with the main:app
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ]
        
        print(f"🔧 Running command: {' '.join(cmd)}")
        print("="*50 + "\n")
        
        # Set PYTHONPATH to current directory
        env = os.environ.copy()
        env['PYTHONPATH'] = project_dir
        
        subprocess.run(cmd, env=env)
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("\n💡 Troubleshooting tips:")
        print("1. Make sure all dependencies are installed: pip install -r requirements.txt")
        print("2. Check if port 8000 is already in use")
        print("3. Verify Python path and working directory")

if __name__ == "__main__":
    main()
