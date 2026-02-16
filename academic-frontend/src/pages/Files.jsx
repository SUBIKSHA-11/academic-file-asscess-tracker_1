import { useEffect, useState } from "react";
import axios from "../api/axios";

function Files() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get("/files")
      .then(res => setFiles(res.data.files));
  }, []);

  return (
    <div>
      <h2>Files</h2>
      {files.map(file => (
        <div key={file._id}>
          <p>{file.fileName}</p>
          <button onClick={() =>
            window.open(`http://localhost:5000/api/files/view/${file._id}`)
          }>
            View
          </button>
        </div>
      ))}
    </div>
  );
}

export default Files;
