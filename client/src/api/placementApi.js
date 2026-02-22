import api from "./axios";

export const getPlacements = () => api.get("/placements");
export const addPlacement = (data) => api.post("/placements", data);
export const updatePlacement = (id, data) =>
  api.patch(`/placements/${id}`, data);
export const deletePlacement = (id) =>
  api.delete(`/placements/${id}`);