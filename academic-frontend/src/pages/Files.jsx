import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import {
  Search,
  Download,
  Eye,
  Trash2,
  Filter
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Pagination from "../components/Pagination";

function AcademicFiles() {
  const { user } = useContext(AuthContext);

  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const limit = 5;

 useEffect(() => {
  fetchFiles(currentPage);
}, [currentPage]);

const fetchFiles = async (page = 1) => {
  try {
    const res = await axios.get(`/files?page=${page}&limit=${limit}`);
    setFiles(res.data.files);
    setTotalPages(res.data.totalPages);
    setCurrentPage(res.data.currentPage);
  } catch (err) {
    console.error(err);
  }
};


  const handleDelete = async (id) => {
    try {
      await axios.delete(`/files/${id}`);
      fetchFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(search.toLowerCase()) &&
    (category ? file.category === category : true)
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Academic Files</h2>

      {/* Filters */}
      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md w-1/3">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search file..."
            className="outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md">
          <Filter size={18} className="text-gray-400" />
          <select
            className="outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="NOTES">NOTES</option>
            <option value="LAB">LAB</option>
            <option value="QUESTION_PAPER">QUESTION_PAPER</option>
          </select>
        </div>
      </div>

      {/* Table */}
     <div className="bg-white rounded-xl shadow-md overflow-x-auto">

        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <tr>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Year</th>
              <th className="p-3 text-left">Semester</th>
              <th className="p-3 text-left">Sensitivity</th>
              <th className="p-3 text-left">Uploaded By</th>
              <th className="p-3 text-left">Downloads</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{file.fileName}</td>
                <td className="p-3">{file.category}</td>
                <td className="p-3">{file.department}</td>
                <td className="p-3">{file.year}</td>
                <td className="p-3">{file.semester}</td>
                <td className="p-3">{file.sensitivity}</td>
                <td className="p-3">{file.uploadedBy?.name}</td>
                <td className="p-3">{file.downloadCount}</td>

                <td className="p-3 flex justify-center gap-3">
                  {/* View */}
                  <button
                    onClick={() =>
                      window.open(
                        `http://localhost:5000/api/files/view/${file._id}`
                      )
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Eye size={18} />
                  </button>

                  {/* Download */}
                  <button
                    onClick={() =>
                      window.open(
                        `http://localhost:5000/api/files/download/${file._id}`
                      )
                    }
                    className="text-orange-500 hover:text-orange-700"
                  >
                    <Download size={18} />
                  </button>

                  {/* Delete - Only Admin & Faculty */}
                  {(user?.role === "ADMIN" ||
                    (user?.role === "FACULTY" &&
                      file.uploadedBy?._id === user._id)) && (
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
    </div>
  );
}

export default AcademicFiles;
