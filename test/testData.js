function makeTestData() {
    return [
        {
            id: 1,
            title: 'Google',
            url: 'https://www.google.com/',
            description: 'Google homepage',
            rating: 4
        },
        {
            id: 2,
            title: 'Thinkful',
            url: 'https://www.thinkful.com/',
            description: 'Thinkful homepage',
            rating: 4
        },
        {
            id: 3,
            title: 'Twitter',
            url: 'https://twitter.com/explore',
            description: 'Twitter homepage',
            rating: 2
        },
        {
            id: 4,
            title: 'Facebook',
            url: 'https://www.facebook.com/',
            description: 'Facebook homepage',
            rating: 3
        }
    ]   
}

module.exports = {
    makeTestData,
}