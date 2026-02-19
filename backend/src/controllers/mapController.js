// backend/src/controllers/mapController.js
const Itinerary = require('../models/Itinerary');

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 * @param {number} lat1 - Latitude do ponto 1
 * @param {number} lon1 - Longitude do ponto 1
 * @param {number} lat2 - Latitude do ponto 2
 * @param {number} lon2 - Longitude do ponto 2
 * @returns {number} Distância em quilômetros
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Arredonda para 2 casas decimais
}

/**
 * Estima o tempo de viagem baseado na distância
 * Assume velocidade média urbana de 30 km/h
 * @param {number} distanceKm - Distância em quilômetros
 * @returns {number} Tempo em minutos
 */
function estimateTravelTime(distanceKm) {
  const avgSpeedKmh = 30; // Velocidade média urbana
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.round(timeHours * 60); // Converte para minutos
}

/**
 * GET /api/roteiros/:id/map
 * Retorna dados do mapa para um roteiro específico
 */
exports.getItineraryMap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar permissão
    const isOwner = userId && itinerary.owner.toString() === userId.toString();
    const isCollaborator = userId && itinerary.collaborators.some(c => c.user.toString() === userId.toString());
    const hasAccess = isOwner || isCollaborator || itinerary.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Extrair todos os pontos com coordenadas
    const points = [];
    const dayRoutes = [];

    itinerary.days.forEach((day) => {
      const dayPoints = [];

      day.activities.forEach((activity, index) => {
        if (activity.location?.coordinates?.lat && activity.location?.coordinates?.lng) {
          const point = {
            id: activity._id.toString(),
            dayNumber: day.dayNumber,
            activityIndex: index,
            time: activity.time,
            title: activity.title,
            location: activity.location.name,
            address: activity.location.address,
            coordinates: {
              lat: activity.location.coordinates.lat,
              lng: activity.location.coordinates.lng,
            },
            category: activity.category,
            estimatedCost: activity.estimatedCost,
            duration: activity.duration,
          };

          points.push(point);
          dayPoints.push(point);
        }
      });

      // Calcular distâncias e tempos entre atividades do dia
      const routes = [];
      for (let i = 0; i < dayPoints.length - 1; i++) {
        const from = dayPoints[i];
        const to = dayPoints[i + 1];
        const distance = calculateDistance(
          from.coordinates.lat,
          from.coordinates.lng,
          to.coordinates.lat,
          to.coordinates.lng
        );
        const travelTime = estimateTravelTime(distance);

        routes.push({
          from: {
            id: from.id,
            title: from.title,
            coordinates: from.coordinates,
          },
          to: {
            id: to.id,
            title: to.title,
            coordinates: to.coordinates,
          },
          distance,
          travelTime,
        });
      }

      if (routes.length > 0) {
        dayRoutes.push({
          dayNumber: day.dayNumber,
          date: day.date,
          routes,
          totalDistance: routes.reduce((sum, r) => sum + r.distance, 0),
          totalTravelTime: routes.reduce((sum, r) => sum + r.travelTime, 0),
        });
      }
    });

    // Calcular centro do mapa (média das coordenadas)
    let centerLat = 0;
    let centerLng = 0;
    if (points.length > 0) {
      centerLat = points.reduce((sum, p) => sum + p.coordinates.lat, 0) / points.length;
      centerLng = points.reduce((sum, p) => sum + p.coordinates.lng, 0) / points.length;
    }

    res.json({
      itineraryId: itinerary._id,
      title: itinerary.title,
      destination: itinerary.destination,
      center: {
        lat: Math.round(centerLat * 1000000) / 1000000,
        lng: Math.round(centerLng * 1000000) / 1000000,
      },
      points,
      dayRoutes,
      statistics: {
        totalPoints: points.length,
        totalDays: dayRoutes.length,
        totalDistance: dayRoutes.reduce((sum, d) => sum + d.totalDistance, 0),
        totalTravelTime: dayRoutes.reduce((sum, d) => sum + d.totalTravelTime, 0),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar mapa do roteiro:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do mapa' });
  }
};

/**
 * GET /api/roteiros/:id/map/day/:dayNumber
 * Retorna dados do mapa para um dia específico
 */
exports.getDayMap = async (req, res) => {
  try {
    const { id, dayNumber } = req.params;
    const userId = req.user?._id;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar permissão
    const isOwner = userId && itinerary.owner.toString() === userId.toString();
    const isCollaborator = userId && itinerary.collaborators.some(c => c.user.toString() === userId.toString());
    const hasAccess = isOwner || isCollaborator || itinerary.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const day = itinerary.days.find(d => d.dayNumber === parseInt(dayNumber));

    if (!day) {
      return res.status(404).json({ message: 'Dia não encontrado' });
    }

    // Extrair pontos do dia
    const points = [];
    const routes = [];

    day.activities.forEach((activity, index) => {
      if (activity.location?.coordinates?.lat && activity.location?.coordinates?.lng) {
        const point = {
          id: activity._id.toString(),
          index,
          time: activity.time,
          title: activity.title,
          location: activity.location.name,
          address: activity.location.address,
          coordinates: {
            lat: activity.location.coordinates.lat,
            lng: activity.location.coordinates.lng,
          },
          category: activity.category,
          estimatedCost: activity.estimatedCost,
          duration: activity.duration,
        };

        points.push(point);

        // Calcular rota para próximo ponto
        if (index > 0 && points[index - 1]) {
          const from = points[index - 1];
          const to = point;
          const distance = calculateDistance(
            from.coordinates.lat,
            from.coordinates.lng,
            to.coordinates.lat,
            to.coordinates.lng
          );
          const travelTime = estimateTravelTime(distance);

          routes.push({
            from: {
              id: from.id,
              title: from.title,
              coordinates: from.coordinates,
            },
            to: {
              id: to.id,
              title: to.title,
              coordinates: to.coordinates,
            },
            distance,
            travelTime,
          });
        }
      }
    });

    // Calcular centro
    let centerLat = 0;
    let centerLng = 0;
    if (points.length > 0) {
      centerLat = points.reduce((sum, p) => sum + p.coordinates.lat, 0) / points.length;
      centerLng = points.reduce((sum, p) => sum + p.coordinates.lng, 0) / points.length;
    }

    res.json({
      dayNumber: day.dayNumber,
      date: day.date,
      title: day.title,
      center: {
        lat: Math.round(centerLat * 1000000) / 1000000,
        lng: Math.round(centerLng * 1000000) / 1000000,
      },
      points,
      routes,
      statistics: {
        totalPoints: points.length,
        totalDistance: routes.reduce((sum, r) => sum + r.distance, 0),
        totalTravelTime: routes.reduce((sum, r) => sum + r.travelTime, 0),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar mapa do dia:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do mapa' });
  }
};

/**
 * GET /api/roteiros/:id/nearby
 * Busca pontos de interesse próximos às atividades do roteiro
 */
exports.getNearbyPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, radius = 1 } = req.query; // radius em km
    const userId = req.user?._id;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Coordenadas são obrigatórias' });
    }

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Roteiro não encontrado' });
    }

    // Verificar permissão
    const isOwner = userId && itinerary.owner.toString() === userId.toString();
    const isCollaborator = userId && itinerary.collaborators.some(c => c.user.toString() === userId.toString());
    const hasAccess = isOwner || isCollaborator || itinerary.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Buscar pontos próximos de todas as atividades
    const nearbyPoints = [];

    itinerary.days.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.location?.coordinates?.lat && activity.location?.coordinates?.lng) {
          const distance = calculateDistance(
            userLat,
            userLng,
            activity.location.coordinates.lat,
            activity.location.coordinates.lng
          );

          if (distance <= radiusKm) {
            nearbyPoints.push({
              id: activity._id.toString(),
              dayNumber: day.dayNumber,
              time: activity.time,
              title: activity.title,
              location: activity.location.name,
              address: activity.location.address,
              coordinates: {
                lat: activity.location.coordinates.lat,
                lng: activity.location.coordinates.lng,
              },
              category: activity.category,
              distance,
            });
          }
        }
      });
    });

    // Ordenar por distância
    nearbyPoints.sort((a, b) => a.distance - b.distance);

    res.json({
      userLocation: { lat: userLat, lng: userLng },
      radius: radiusKm,
      points: nearbyPoints,
      total: nearbyPoints.length,
    });
  } catch (error) {
    console.error('Erro ao buscar pontos próximos:', error);
    res.status(500).json({ message: 'Erro ao buscar pontos próximos' });
  }
};
