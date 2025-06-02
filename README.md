# AirGrist - Airtbale -> Grist Sync Tool

A Flask web application for synchronizing data between Airtable and Grist databases.

## Project Structure

```
project/
│
├── app.py             # Main application
├── airtable_handler.py
├── grist_handler.py
├── requirements.txt   # Python dependencies
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore file
├── README.md          # This file
│
├── templates/         # HTML templates
│   └── index.html     # Main UI
│
└── static/            # Static files (CSS, JS, images)
    └── (empty for now)
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-name>
```

### 2. Create a virtual environment

```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. Create the templates directory

```bash
mkdir -p templates
# Place the index.html file in the templates directory
```

## Running the Flask App

### Development Mode

```bash
# Make sure your virtual environment is activated
python app.py
```

The app will be available at `http://localhost:5000`

### Production Mode (using Gunicorn)

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Quick Hosting Options

### 1. **ngrok** (Easiest for hackathons)

```bash
# Install ngrok
# macOS: brew install ngrok
# Or download from https://ngrok.com/

# Run Flask app
python app.py

# In another terminal
ngrok http 5000
```

### 2. **Replit**

- Create new Python repl
- Upload all files
- Run will auto-detect Flask
- Get instant public URL

### 3. **Railway**

```bash
# Install Railway CLI
# npm i -g @railway/cli

railway login
railway init
railway up
```

### 4. **Render**

- Connect GitHub repo
- Set build command: `pip install -r requirements.txt`
- Set start command: `gunicorn app:app`
- Deploy automatically on push

### 5. **Python Anywhere**

- Free tier available
- Upload files via web interface
- Configure WSGI
- Get `username.pythonanywhere.com` URL

## Collaboration Tips

1. **Use feature branches**

   ```bash
   git checkout -b feature/airtable-integration
   ```

2. **Keep .env local**

   - Never commit `.env` file
   - Share credentials securely via password manager

3. **Quick sync**
   ```bash
   git pull origin main
   git push origin your-branch
   ```

## Next Steps

1. **Implement Airtable integration**

   - Use `pyairtable` library
   - Add error handling
   - Implement data mapping

2. **Implement Grist integration**

   - Research Grist API
   - Add authentication
   - Handle data transformation

3. **Add features**
   - Data preview
   - Field mapping UI
   - Sync scheduling
   - Progress indicators

## API Endpoints

- `GET /` - Main UI
- `POST /api/save-config` - Save configuration
- `POST /api/pull-airtable` - Pull data from Airtable (stub)
- `POST /api/push-grist` - Push data to Grist (stub)

## Environment Variables

See `.env.example` for all available configuration options.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use for your hackathon!
