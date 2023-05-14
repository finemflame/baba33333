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

    const apiUrl = `https://markmystories.com/wp-json/wp/v2/posts?slug=${postId}`;

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
      // ...

      useHead({
        title: metaData?.title,
        meta: [
          // ...
        ],
        link: [
          // ...
        ],
      });

      // Cache the response
      await cacheResponse(apiUrl, json);

      return data;
    } else {
      throw { statusCode: 404, message: 'Post not found' };
    }
  } catch (error) {
    router.replace('/error'); // Redirect to an error page
  }
};

const data = computed(() => fetchData());

const formatDate = (date) => {
  let d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

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

onMounted(() => {
  data.value; // Trigger the data fetching on component mount
});
</script>

<style scoped>
.post-content img {
  max-width: 100%;
}
</style>
