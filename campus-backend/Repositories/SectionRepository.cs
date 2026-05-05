using System.Data;
using Oracle.ManagedDataAccess.Client;
using campus_backend.Models;

namespace campus_backend.Repositories
{
    public class SectionRepository : ISectionRepository
    {
        private readonly string _connectionString;

        public SectionRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleConnection") ?? "";
        }

        public async Task<IEnumerable<SectionDTO>> GetAllSectionsAsync()
        {
            var sections = new List<SectionDTO>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // Grabs the Section data, counts the enrollments, and fetches the first Professor/Subject assigned to it via schedules
                string sql = @"
                    SELECT 
                        s.SECTION_ID, s.SECTION_NAME, s.COURSE, s.YEAR_LEVEL,
                        (SELECT COUNT(*) FROM ENROLLMENTS e WHERE e.SECTION_ID = s.SECTION_ID) as STUDENT_COUNT,
                        (SELECT u.FIRST_NAME || ' ' || u.LAST_NAME FROM SCHEDULES sch JOIN USERS u ON sch.PROFESSOR_ID = u.USER_ID WHERE sch.SECTION_ID = s.SECTION_ID FETCH FIRST 1 ROWS ONLY) as ADVISER_NAME,
                        (SELECT sub.TITLE FROM SCHEDULES sch JOIN SUBJECTS sub ON sch.SUBJECT_CODE = sub.SUBJECT_CODE WHERE sch.SECTION_ID = s.SECTION_ID FETCH FIRST 1 ROWS ONLY) as SUBJECT_TITLE
                    FROM SECTIONS s
                    ORDER BY s.YEAR_LEVEL, s.SECTION_NAME";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            sections.Add(new SectionDTO
                            {
                                Section_ID = reader["SECTION_ID"].ToString() ?? "",
                                Section_Name = reader["SECTION_NAME"].ToString() ?? "",
                                Course = reader["COURSE"].ToString() ?? "",
                                Year_Level = Convert.ToInt32(reader["YEAR_LEVEL"]),
                                Student_Count = Convert.ToInt32(reader["STUDENT_COUNT"]),
                                Primary_Adviser = reader["ADVISER_NAME"]?.ToString(),
                                Primary_Subject = reader["SUBJECT_TITLE"]?.ToString()
                            });
                        }
                    }
                }
            }
            return sections;
        }

        public async Task<IEnumerable<Student>> GetStudentsInSectionAsync(string sectionId)
        {
            var students = new List<Student>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    SELECT st.STUDENT_ID, st.FIRST_NAME, st.MIDDLE_NAME, st.LAST_NAME, st.FACE_REFERENCE_PATH 
                    FROM STUDENTS st 
                    JOIN ENROLLMENTS e ON st.STUDENT_ID = e.STUDENT_ID 
                    WHERE e.SECTION_ID = :secid 
                    ORDER BY st.LAST_NAME";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("secid", sectionId));
                    await con.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            students.Add(new Student
                            {
                                Student_ID = reader["STUDENT_ID"]?.ToString() ?? "",
                                First_Name = reader["FIRST_NAME"]?.ToString() ?? "",
                                Last_Name = reader["LAST_NAME"]?.ToString() ?? "",
                                Middle_Name = reader["MIDDLE_NAME"]?.ToString() ?? "", // FIX: Added ?? ""
                                Face_Reference_Path = reader["FACE_REFERENCE_PATH"]?.ToString() ?? "" // FIX: Added ?? ""
                            });
                        }
                    }
                }
            }
            return students;
        }

        public async Task AddStudentsToSectionAsync(string sectionId, List<string> studentIds)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                await con.OpenAsync();
                foreach (var sId in studentIds)
                {
                    string sql = "INSERT INTO ENROLLMENTS (ENROLLMENT_ID, STUDENT_ID, SECTION_ID) VALUES (:eid, :sid, :secid)";
                    using (OracleCommand cmd = new OracleCommand(sql, con))
                    {
                        cmd.Parameters.Add(new OracleParameter("eid", "ENR-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper()));
                        cmd.Parameters.Add(new OracleParameter("sid", sId));
                        cmd.Parameters.Add(new OracleParameter("secid", sectionId));
                        try { await cmd.ExecuteNonQueryAsync(); } 
                        catch { /* Ignore if already enrolled to prevent crashes */ }
                    }
                }
            }
        }

        public async Task RemoveStudentFromSectionAsync(string sectionId, string studentId)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "DELETE FROM ENROLLMENTS WHERE SECTION_ID = :secid AND STUDENT_ID = :sid";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("secid", sectionId));
                    cmd.Parameters.Add(new OracleParameter("sid", studentId));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}