require('dotenv').config();
require('../lib/mongoose-connector')();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../lib/app');
const Podcast = require('../lib/models/Podcast');

describe('podcast pub/sub API', () => {
    let podcasts = Array.apply(null, { length: 30 }).map(() => {
        return {
            name:'Last Podcast on the Left',
            type: 'murder',
            episodes: 350,
            length: 60
        };
    });
    let createdPodcasts;

    const createPodcast = podcast => {
        return request(app)
            .post('/api/podcasts')
            .send(podcast)
            .then(res => res.body);
    };

    beforeEach(() => {
        return Podcast.deleteMany();
    });

    beforeEach(() => {
        return Promise.all(podcasts.map(createPodcast)).then(podcastsRes => {
            createdPodcasts = podcastsRes;
        });
    });

    afterAll(() => {
        mongoose.disconnect();
    });

    it('creates a podcast on post', () => {
        return request(app)
            .post('/api/podcasts')
            .send({
                name: 'Last Podcast on the Left',
                type: 'murder',
                episodes: 350,
                length: 60
            })
            .then(res => {
                expect(res.body).toEqual({
                    _id: expect.any(String),
                    __v: expect.any(Number),
                    name: 'Last Podcast on the Left',
                    type: 'murder',
                    episodes: 350,
                    length: 60
                });
            });
    });

    it('gets podcast by id', () => {
        return request(app)
            .get(`/api/podcasts/${createdPodcasts[0]._id}`)
            .then(res => {
                expect(res.body).toEqual(createdPodcasts[0]);
            });
    });

    it('gets all podcasts', () => {
        return request(app)
            .get('/api/podcasts')
            .query({ type: 'murder' })
            .then(res => {
                expect(res.body).toEqual(createdPodcasts);
            });
    });

    it('updates podcasts', () => {
        createdPodcasts[0].episodes = 351;
        return request(app)
            .put(`/api/podcasts/${createdPodcasts[0]._id}`)
            .send(createdPodcasts[0])
            .then(res => {
                expect(res.body).toEqual(createdPodcasts[0]);
            });
    });

    it('deletes a podcast', () => {
        return request(app)
            .delete(`/api/podcasts/${createdPodcasts[0]._id}`)
            .then(res => {
                expect(res.body).toEqual({ removed: true });
                return request(app)
                    .delete(`/api/podcasts/${createdPodcasts[0]._id}`)
                    .then(res => {
                        expect(res.body).toEqual({ removed: false });
                    });
            });
    });
});
