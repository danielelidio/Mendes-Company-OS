FROM eclipse-temurin:21-jre-jammy

# Node.js (firebase-tools) on top of the JDK 21 runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates gnupg bash \
  && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g firebase-tools

# Pre-download emulator artifacts so the container starts quickly.
RUN firebase setup:emulators:firestore && firebase setup:emulators:ui

WORKDIR /srv
EXPOSE 4000 9099 8080 9199

CMD ["firebase", "emulators:start", "--project", "mendes-company-os-dev"]
