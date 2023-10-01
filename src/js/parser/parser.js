export const getFeed = (data) => {
    const title = data.querySelector('channel > title').textContent;
    const subtitle = data.querySelector('channel > description').textContent;
    return { title, subtitle }
};

export const getPosts = (data) => {
    return Array.from(data.querySelectorAll('channel item')).map((item) => {
        const title = item.querySelector('title').textContent
        const description = item.querySelector('description').textContent
        const link = item.querySelector('link').textContent
        return { title, description, link }
    })
};

export const parse = (xml) => {
    const parser = new DOMParser();
    return parser.parseFromString(xml, 'application/xml');
}