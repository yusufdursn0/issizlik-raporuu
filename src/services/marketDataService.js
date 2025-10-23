const MarketSnapshot = require('../models/MarketSnapshot');


/**
* Gerçek sistemde bu servis aşağıdakileri yapar:
* - TÜİK istihdam verileri (API/CSV) ingest
* - İş ilanı panelleri (Kariyer.net, LinkedIn Jobs, Indeed, vb.) scraper/API
* - Günlük/haftalık snapshot alıp MongoDB'ye yazar
* Burada örnek/stub verisi sağlıyoruz.
*/
async function ensureMockSnapshot() {
    const count = await MarketSnapshot.countDocuments();
    if (count > 0) return;


    const mock = new MarketSnapshot({
        skills: new Map([
            ['PYTHON', { demand: 0.8, trend: 0.3, obsolete: false }],
            ['AWS', { demand: 0.85, trend: 0.4, obsolete: false }],
            ['REACT', { demand: 0.9, trend: 0.5, obsolete: false }],
            ['ANGULARJS', { demand: 0.2, trend: -0.6, obsolete: true }],
            ['PHP 5', { demand: 0.25, trend: -0.4, obsolete: true }],
            ['SQL', { demand: 0.75, trend: 0.1, obsolete: false }],
            ['DOCKER', { demand: 0.7, trend: 0.2, obsolete: false }],
            ['NODE', { demand: 0.8, trend: 0.3, obsolete: false }]
        ]),
        cityRoleDemand: new Map([
            ['İstanbul|Frontend Geliştirici', 0.85],
            ['İstanbul|Backend Geliştirici', 0.88],
            ['Ankara|Frontend Geliştirici', 0.65],
            ['İzmir|Frontend Geliştirici', 0.6]
        ])
    });
    await mock.save();
}


async function getLatestSnapshot() {
    await ensureMockSnapshot();
    return MarketSnapshot.findOne({}, {}, { sort: { createdAt: -1 } });
}


module.exports = { getLatestSnapshot };