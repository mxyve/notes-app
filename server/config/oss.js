import OSS from "ali-oss";

const client = new OSS({
  region: "oss-cn-nanjing", // 例如: 'oss-cn-hangzhou'
  accessKeyId: "LTAI5tQnFUmsUb2gMFdE7W2d",
  accessKeySecret: "McFDTO4w3onWHaSBjKSnFr05IfQShq",
  bucket: "mxy-u",
});

export default client;
