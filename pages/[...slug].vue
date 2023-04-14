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
const route = useRoute();
let data;
if (route.params.slug) {
  let id = route.params.slug;
  //check id is array or not
  if (Array.isArray(id)) {
    id = id[0];
  }

  const apiUrl = `https://zooms.wiki/wp-json/wp/v2/posts?slug=${id}`;
  const response = await fetch(apiUrl);
  const json = await response.json();
  //console.log(data);
  if (json.length > 0) {
    data = json[0];
    const metaData = data.yoast_head_json;
    //convert properties from yoast_head_json to array
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
    //case og_image
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
    //console.log(meta);

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
        { rel: "icon", sizes: "32x32", href: "/_nuxt/assets/img/32x32.png" },
        { rel: "icon", sizes: "192x192", href: "/_nuxt/assets/img/192x192.png" },
        { rel: "apple-touch-icon", href: "/_nuxt/assets/img/180x180.png" },
      ],
    });
  } else {
    throw { statusCode: 404, message: "Post not found" };
  }
}

const formatDate = function (date) {
  let d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  let year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};
</script>
<style scoped>
.post-content img {
  max-width: 100%;
}
</style>
