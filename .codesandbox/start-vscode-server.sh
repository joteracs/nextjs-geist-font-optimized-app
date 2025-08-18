
#!/bin/bash
while true; do
  cd /opt/vscodium && ./bin/code-server --port 1025 --without-connection-token --accept-server-license-terms --host 0.0.0.0
  echo "code-server terminated with exit code $?. Restarting in 3 seconds..."
  sleep 3
done
