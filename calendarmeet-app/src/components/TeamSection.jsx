const team = [
  {
    name: "Bryan Sancehz",
    role: "Full-stack Developer, UX/UI Designer",
    img: "/images/bryan.png",
    linkedin: "#",
    github: "#",
  },
  {
    name: "	Emily Tran",
    role: "Full-stack Developer",
    img: "/images/emily.png",
    linkedin: "#",
    github: "#",
  },
  {
    name: "Erik Ignacio",
    role: "Full-stack Developer",
    img: "/images/erik.png",
    linkedin: "#",
    github: "#",
  },
  {
    name: " Abhishek Sarepaka",
    role: "Full-stack Developer",
    img: "/images/Abi.png",
    linkedin: "#",
    github: "#",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="bg-gray-50 py-16 px-8">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Meet Our Team
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {team.map((member) => (
          <div
            key={member.name}
            className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg transition"
          >
            <img
              src={member.img}
              alt={member.name}
              className="w-28 h-28 mx-auto rounded-lg mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold text-gray-800">
              {member.name}
            </h3>
            <p className="text-sm text-gray-600">{member.role}</p>

            <div className="mt-3 space-x-3">
              <a
                href={member.linkedin}
                className="text-blue-600 hover:text-blue-800"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href={member.github}
                className="text-gray-800 hover:text-black"
              >
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
