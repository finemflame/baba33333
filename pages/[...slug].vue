<template>
  <div v-if="postData">
    <h1>{{ postData.title.rendered }}</h1>
    <div v-html="postData.content.rendered"></div>
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
    const response = await fetch(apiUrl);
    const json = await response.json();

    if (json.length > 0) {
      const postData = json[0];

      // Process post data and metadata
      const metaData = postData.yoast_head_json;
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

      return postData;
    } else {
      throw new Error('Post not found');
    }
  } catch (error) {
    router.replace('/error'); // Redirect to an error page
  }
};

const postData = computed(() => fetchData());

onMounted(() => {
  postData.value; // Trigger the data fetching on component mount
});
</script>

<style scoped>
/* ... */
</style>
