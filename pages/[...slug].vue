<template>
  <div class="post" v-if="data">
    <h1 class="title mt-3" v-html="data.title.rendered"></h1>
    <div class="post-meta">
      <span class="date me-1">{{ formatDate(data.date) }}</span>
    </div>
    <div class="post-content mt-2" v-html="data.content.rendered"></div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@vueuse/head';

const route = useRoute();
const router = useRouter();

const fetchData = async () => {
  try {
    const slug = route.params.slug;
    const postId = Array.isArray(slug) ? slug[0] : slug;

    const apiUrl = `https://zooms.wiki/wp-json/wp/v2/posts?slug=${postId}`;

    // Check if the response is already cached at the edge
    if (router?.response?.headers?.get('x-vercel-cache') === 'HIT') {
      const cachedData = await getCachedData(apiUrl);
      if (cachedData) {
        return cachedData;
      }
    }

    const response = await fetch(apiUrl);
    const json = await response.json();

    if (json.length > 0) {
      const data = json[0];
      const metaData = data.yoast_head_json;

      // Convert properties from yoast_head_json to array
      let meta = Object.entries(metaData)
        .filter((item) => {
          return [
            "og_locale",
            "og_type",
            "og_title",
            "og_description",
            "og_url",
            "og_site_name",
            "article_published_time",
            "twitter_card",
          ].includes(item[0]);
        })
        .map((item) => {
          if (item[0] === "twitter_card") {
            return {
              name: "twitter:card",
              content: item[1],
            };
          }
          return {
            property: item[0]
              .replace("og_", "og:")
              .replace("article_", "article:")
              .replace("twitter_", "twitter:"),
            content: item[1],
          };
        });

      // Case og_image
      if (metaData.og_image) {
        let imageMeta = [
          {
            property: "og:image",
            content: metaData.og_image[0].url,
          },
          {
            property: "og:image:width",
            content: metaData.og_image[0].width,
          },
          {
            property: "og:image:height",
            content: metaData.og_image[0].height,
          },
          {
            property: "og:image:type",
            content: metaData.og_image[0].type,
          },
        ];
        meta.push(...imageMeta);
      }
      if (metaData.twitter_misc) {
        let tmp = Object.entries(metaData.twitter_misc);
        tmp.forEach((item, key) => {
          meta.push({
            name: `twitter:label${key + 1}`,
            content: item[0],
          });
          meta.push({
            name: `twitter:data${key + 1}`,
            content: item[1],
          });
        });
      }

      useHead({
        title: metaData?.title,
        meta: [
          ...meta,
          {
            name: "description",
            content: metaData?.og_description,
          },
        ],
        link: [
          { rel: "icon",
        sizes: "32x32",
        href: "/_nuxt/assets/img/32x32.png",
      },
      {
        rel: "icon",
        sizes: "192x192",
        href: "/_nuxt/assets/img/192x192.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/_nuxt/assets/img/180x180.png",
      },
    ],
  });

  return data;
} else {
  throw { statusCode: 404, message: "Post not found" };
}
} catch (error) {
  router.replace('/error'); // Redirect to an error page
}
};

const data = computed(() => fetchData());

const getCachedData = async (url) => {
  const cache = await caches.open('cdn-cache');
  const cachedResponse = await cache.match(url);
  if (cachedResponse) {
    return await cachedResponse.json();
  }
  return null;
};

const cacheResponse = async (url, data) => {
  const cache = await caches.open('cdn-cache');
  const response = new Response(JSON.stringify(data));
  await cache.put(url, response);
};

const formatDate = (date) => {
  let d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

onMounted(() => {
  data.value; // Trigger the data fetching on component mount
});
</script>

<style scoped>
.post-content img {
  max-width: 100%;
}
</style>
