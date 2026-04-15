interface MediaItemPreview {
  title?: string;
  type?: string;
  srcset?: unknown;
}

async function test() {
  const authorName = 'Albert Einstein';
  const url = 'https://en.wikipedia.org/api/rest_v1/page/media-list/' + encodeURIComponent(authorName);
  const response = await fetch(url);
  const data = (await response.json()) as { items?: MediaItemPreview[] };
  console.log(JSON.stringify(data.items?.slice(0, 3).map((item) => ({
    title: item.title,
    type: item.type,
    srcset: item.srcset, 
  })), null, 2));
}
test();
