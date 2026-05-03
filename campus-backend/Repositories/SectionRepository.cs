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
            _connectionString = configuration.GetConnectionString("OracleConnection") 
                ?? throw new InvalidOperationException("Oracle connection string is missing.");
        }

        public async Task<IEnumerable<Section>> GetAllSectionsAsync()
        {
            var sections = new List<Section>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                // Ordered by Year and Course to automatically categorize for the UI
                string sql = "SELECT * FROM SECTIONS ORDER BY YEAR_LEVEL ASC, COURSE ASC, SECTION_NAME ASC";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            sections.Add(new Section
                            {
                                Section_ID = reader["SECTION_ID"].ToString(),
                                Campus = reader["CAMPUS"].ToString(),
                                Course = reader["COURSE"].ToString(),
                                Year_Level = Convert.ToInt32(reader["YEAR_LEVEL"]),
                                Section_Letter = reader["SECTION_LETTER"].ToString(),
                                Section_Name = reader["SECTION_NAME"].ToString()
                            });
                        }
                    }
                }
            }
            return sections;
        }

        public async Task<IEnumerable<RosterStudent>> GetSectionRosterAsync(string sectionId)
        {
            var roster = new List<RosterStudent>();
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"
                    SELECT DISTINCT s.STUDENT_ID, s.FIRST_NAME, s.LAST_NAME, s.ENROLLMENT_STATUS 
                    FROM STUDENTS s 
                    JOIN ENROLLMENTS e ON s.STUDENT_ID = e.STUDENT_ID 
                    JOIN SCHEDULES sch ON e.SCHEDULE_ID = sch.SCHEDULE_ID 
                    WHERE sch.SECTION_ID = :sectionId
                    ORDER BY s.LAST_NAME ASC";

                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("sectionId", sectionId));
                    await con.OpenAsync();
                    using (OracleDataReader reader = (OracleDataReader)await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            roster.Add(new RosterStudent
                            {
                                Student_ID = reader["STUDENT_ID"].ToString(),
                                First_Name = reader["FIRST_NAME"].ToString(),
                                Last_Name = reader["LAST_NAME"].ToString(),
                                Enrollment_Status = reader["ENROLLMENT_STATUS"].ToString()
                            });
                        }
                    }
                }
            }
            return roster;
        }

        public async Task CreateSectionAsync(Section section)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = @"INSERT INTO SECTIONS (SECTION_ID, CAMPUS, COURSE, YEAR_LEVEL, SECTION_LETTER, SECTION_NAME) 
                               VALUES (:id, :campus, :course, :year, :letter, :name)";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", section.Section_ID));
                    cmd.Parameters.Add(new OracleParameter("campus", section.Campus));
                    cmd.Parameters.Add(new OracleParameter("course", section.Course));
                    cmd.Parameters.Add(new OracleParameter("year", section.Year_Level));
                    cmd.Parameters.Add(new OracleParameter("letter", section.Section_Letter));
                    cmd.Parameters.Add(new OracleParameter("name", section.Section_Name));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }

        public async Task DeleteSectionAsync(string id)
        {
            using (OracleConnection con = new OracleConnection(_connectionString))
            {
                string sql = "DELETE FROM SECTIONS WHERE SECTION_ID = :id";
                using (OracleCommand cmd = new OracleCommand(sql, con))
                {
                    cmd.Parameters.Add(new OracleParameter("id", id));
                    await con.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
            }
        }
    }
}