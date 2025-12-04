if (file) {
  imageURL = await uploadImage(file, `posts/${user.uid}/${Date.now()}`);
}

