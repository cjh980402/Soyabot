import BaseYouTubeAPI from 'simple-youtube-api';
import { PARTS, ENDPOINTS } from 'simple-youtube-api/src/util/Constants.js';
import Video from 'simple-youtube-api/src/structures/Video.js';

export class YouTubeAPI extends BaseYouTubeAPI {
    async getVideosByIDs(ids, options = {}) {
        const result = await this.request.make(ENDPOINTS.Videos, { ...options, part: PARTS.Videos, id: ids.join(',') });
        if (result.items.length > 0) {
            return result.items.map((v) => (v ? new Video(this, v) : null));
        } else {
            throw new Error(`resource ${result.kind} not found`);
        }
    }
}
