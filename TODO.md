# TODO

## Filtrage dashboard technicien par site
- [ ] Étendre le filtrage `responsable_site` -> `technicien` pour :
  - [ ] controllers/sites.controller.js (GET /api/sites)
  - [ ] controllers/rooms.controller.js (GET /api/rooms)
  - [ ] controllers/equipment.controller.js (GET /api/equipments)
  - [ ] controllers/incidents.controller.js (GET /api/incidents)
  - [ ] controllers/access.controller.js (GET /api/access et stats/logs)
- [ ] Ajouter un filtrage pour EOL Alerts non résolues si nécessaire (Dashboard utilise `/api/eol-alerts/unresolved`).
- [ ] Vérifier côté front : Dashboard, Rooms, Equipment, Incidents utilisent bien les endpoints backend filtrés.
- [ ] Lancer le serveur + test manuel avec un technicien assigné à un site.

