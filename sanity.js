import sanityClient from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = sanityClient({
  projectId:'gy2nnweu',
  dataset:'production',
  apiVersion:'2021-03-25',
  token:'sknRS0dnkKYmBxAhJQcxwoOCgWxAW92Vj5FhNj1CQXlkZbCgt40wCrxehje6vf6UZr6icqtD8bklSojjDHgvpWcdVYTHvJudOnHrXPQCYTvO7hcJyMRguBmUdjlILiBCZSdfs8cpevM9Mlp8NnbO2RzOX2hRhPqEKPVjWbPg1ckbVxWdIGH0',
  useCdn:'false',
})

const builder = imageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)