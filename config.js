/*******************************************************************************
 * tviz config
 *
 * tviz configuration
 *
 *
*******************************************************************************/

var config = {
    app_root: '/srv/tviz',
    
    // Twitter configuration
    twitter: {
        consumer_key:        '4YN0l3eU6obxMd9xrL2mg',
        consumer_secret:     'kmlVD0BcLCpJ9FllXG7gqdcwue6PVZBQPPholwnfjo',
        access_token_key:    '318742386-xg6iIGwrNrwmvEzltSCIM13Hs0kRXU3xZYUHGkAN',
        access_token_secret: 'bnHrvFk2SSswwNU89dn5otBFeseMP9eky09GfKu5Ck'
    },
    // Mongo configuration
    mongodb: {
        database_server:  'localhost',
        database_port:    27017,
        database_name:    'daneel',
        database_options: {auto_reconnect: true},
        collections:      {raw: 'raw',
                           processed: 'processed'
        }
    },
    // Daneel configuration
    daneel: {
        twitter_timeout: 5000,
        breadth:         10,
        depth:           10,
    },
    
    tviz: {
        port: 8081
    }
}

module.exports = config;
