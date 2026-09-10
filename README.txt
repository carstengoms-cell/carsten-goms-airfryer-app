CARSTEN GOMS · AIRFRYER DELUXE – PWA PROTOTYP

Enthalten:
- 56 Rezepte aus dem Airfryer-Deluxe-Buch
- Suche und Kategorien
- Filter nach Ninja-Funktion
- Favoriten
- neue Rezepte anlegen, bearbeiten und löschen
- eigene Rezeptbilder speichern
- Einkaufsliste aus ausgewählten Rezepten
- JSON-Backup / Import
- offline-fähige PWA, sobald sie über HTTPS gehostet wird

TEST AM PC
1. Ordner entpacken.
2. Im Ordner ein Terminal öffnen.
3. python -m http.server 8080
4. Browser: http://localhost:8080

AUF DEM HANDY INSTALLIEREN
Die App muss über HTTPS erreichbar sein. Am einfachsten den gesamten Ordner bei einem statischen Hoster veröffentlichen (z. B. Netlify Drop, GitHub Pages oder Cloudflare Pages). Danach die Adresse auf dem Handy öffnen und „Zum Home-Bildschirm“ / „Installieren“ wählen.

DATENSPEICHERUNG
Rezepte und hochgeladene Bilder werden in dieser ersten Version lokal im Browser (IndexedDB) gespeichert. Für echte Synchronisation zwischen PC und Handy wäre als nächster Schritt eine Cloud-Datenbank mit Benutzerkonto sinnvoll.

NEU IN DIESER VERSION
- Mengenrechner je Rezept von 1 bis 100 Personen
- Zutatenmengen werden anhand der Grundportion automatisch skaliert
- Feld „Grundrezept für Personen“ beim Anlegen/Bearbeiten
- Cloud-Synchronisation PC ↔ Smartphone per persönlichem Sync-Code
- Netlify Blobs als zentraler Speicher; lokale Daten bleiben offline verfügbar
- automatischer Sync beim Start, nach Änderungen und wenn die App wieder online ist

WICHTIG FÜR CLOUD-SYNC
Diese Version enthält eine Netlify Function. Für echte Synchronisation muss das Projekt als Netlify-Projekt mit Build/Functions veröffentlicht werden (am besten über GitHub + Netlify Continuous Deployment oder Netlify CLI). Ein reiner statischer Drag-&-Drop-Deploy kann die Function nicht zuverlässig bereitstellen.
