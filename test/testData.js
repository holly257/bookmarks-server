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

function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id: 911,
        url: 'https://bad.com',
        rating: '1',
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    const expectedBookmark = {
        ...maliciousBookmark,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
        maliciousBookmark,
        expectedBookmark
    }

}

module.exports = {
    makeTestData,
    makeMaliciousBookmark
}