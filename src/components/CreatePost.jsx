if (file) {
  imageURL = await uploadImage(file, `posts/${user.uid}/${Date.now()}`);
}

const [file, setFile] = useState(null);
<input 
  type="file"
  accept="image/*"
  className="hidden"
  id="post-image-input"
  onChange={(e) => setFile(e.target.files[0])}
/>
<button 
  onClick={() => document.getElementById("post-image-input").click()}
  className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center gap-2"
>
  <ImageIcon size={20} />
  <span className="text-sm font-medium">Photo</span>
</button>
