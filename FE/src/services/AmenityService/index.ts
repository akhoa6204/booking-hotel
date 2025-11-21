import httpClient from "..";

export default class AmenityService {
  static async list() {
    const res = await httpClient.get("/amenities");
    return res.data.items;
  }
}
