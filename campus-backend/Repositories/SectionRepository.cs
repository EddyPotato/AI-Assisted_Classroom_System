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
                                Middle_Name = reader["MIDDLE_NAME"]?.ToString() ?? "",
                                Face_Reference_Path = reader["FACE_REFERENCE_PATH"]?.ToString() ?? ""
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
                        catch { /* Ignore if already enrolled */ }
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

        public async Task<IEnumerable<SectionScheduleDTO>> GetSectionScheduleAsync(string sectionId)
        {
            var schedule = new List<SectionScheduleDTO>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // THE FIX: Added u.FACE_REFERENCE_PATH to the query
                string sql = @"
                    SELECT 
                        sch.SCHEDULE_ID, sub.SUBJECT_CODE, sub.TITLE, sub.UNITS,
                        u.FIRST_NAME, u.MIDDLE_NAME, u.LAST_NAME, u.FACE_REFERENCE_PATH,
                        sch.CLASS_DAYS, sch.TIME_START, sch.TIME_END, sch.ROOM_ID
                    FROM SCHEDULES sch
                    JOIN SUBJECTS sub ON sch.SUBJECT_CODE = sub.SUBJECT_CODE
                    LEFT JOIN USERS u ON sch.PROFESSOR_ID = u.USER_ID
                    WHERE sch.SECTION_ID = :secid
                    ORDER BY sub.SUBJECT_CODE";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("secid", sectionId));
                    await con.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            string profName = "Unassigned";
                            if (reader["FIRST_NAME"] != DBNull.Value && reader["LAST_NAME"] != DBNull.Value)
                            {
                                string first = reader["FIRST_NAME"].ToString()!;
                                string middle = reader["MIDDLE_NAME"] != DBNull.Value ? $" {reader["MIDDLE_NAME"].ToString()![0]}." : "";
                                string last = reader["LAST_NAME"].ToString()!;
                                profName = $"{first}{middle} {last}";
                            }

                            schedule.Add(new SectionScheduleDTO
                            {
                                Schedule_ID = reader["SCHEDULE_ID"]?.ToString() ?? "",
                                Subject_Code = reader["SUBJECT_CODE"]?.ToString() ?? "",
                                Subject_Title = reader["TITLE"]?.ToString() ?? "",
                                Units = reader["UNITS"] != DBNull.Value ? Convert.ToInt32(reader["UNITS"]) : 0,
                                Professor_Name = profName,
                                
                                // THE FIX: Map the face path from the reader
                                Professor_Face_Reference_Path = reader["FACE_REFERENCE_PATH"]?.ToString(),
                                
                                Class_Days = reader["CLASS_DAYS"]?.ToString() ?? "TBA",
                                Time_Start = reader["TIME_START"]?.ToString() ?? "TBA",
                                Time_End = reader["TIME_END"]?.ToString() ?? "TBA",
                                Room_ID = reader["ROOM_ID"]?.ToString() ?? "TBA"
                            });
                        }
                    }
                }
            }
            return schedule;
        }
    }
}