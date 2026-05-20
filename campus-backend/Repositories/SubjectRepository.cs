using campus_backend.Models;
using Oracle.ManagedDataAccess.Client;

namespace campus_backend.Repositories
{
    public class SubjectRepository : ISubjectRepository
    {
        private readonly string _connectionString;

        public SubjectRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? configuration.GetConnectionString("OracleConnection")
                ?? throw new InvalidOperationException("Connection string not found. Ensure 'DefaultConnection' or 'OracleConnection' is configured in appsettings.json");
        }

        public async Task<IEnumerable<Subject>> GetAllSubjectsAsync()
        {
            var subjects = new List<Subject>();
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand("SELECT * FROM CAMPUS_ADMIN.SUBJECTS ORDER BY SUBJECT_CODE", connection);
            
            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                subjects.Add(new Subject
                {
                    Subject_Code = reader["SUBJECT_CODE"].ToString()!,
                    Title = reader["TITLE"].ToString()!,
                    Prerequisites = reader["PREREQUISITES"] != DBNull.Value ? reader["PREREQUISITES"].ToString() : null,
                    Units = Convert.ToInt32(reader["UNITS"])
                });
            }
            return subjects;
        }

        public async Task<Subject?> GetSubjectByIdAsync(string subjectCode)
        {
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand("SELECT * FROM CAMPUS_ADMIN.SUBJECTS WHERE SUBJECT_CODE = :code", connection);
            command.Parameters.Add(new OracleParameter("code", subjectCode));
            
            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Subject
                {
                    Subject_Code = reader["SUBJECT_CODE"].ToString()!,
                    Title = reader["TITLE"].ToString()!,
                    Prerequisites = reader["PREREQUISITES"] != DBNull.Value ? reader["PREREQUISITES"].ToString() : null,
                    Units = Convert.ToInt32(reader["UNITS"])
                };
            }
            return null;
        }

        public async Task<bool> CreateSubjectAsync(Subject subject)
        {
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand(
                "INSERT INTO CAMPUS_ADMIN.SUBJECTS (SUBJECT_CODE, TITLE, PREREQUISITES, UNITS) VALUES (:code, :title, :prereq, :units)", connection);
            
            command.Parameters.Add(new OracleParameter("code", subject.Subject_Code));
            command.Parameters.Add(new OracleParameter("title", subject.Title));
            command.Parameters.Add(new OracleParameter("prereq", (object?)subject.Prerequisites ?? DBNull.Value));
            command.Parameters.Add(new OracleParameter("units", subject.Units));

            await connection.OpenAsync();
            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> UpdateSubjectAsync(Subject subject)
        {
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand(
                "UPDATE CAMPUS_ADMIN.SUBJECTS SET TITLE = :title, PREREQUISITES = :prereq, UNITS = :units WHERE SUBJECT_CODE = :code", connection);
            
            command.Parameters.Add(new OracleParameter("title", subject.Title));
            command.Parameters.Add(new OracleParameter("prereq", (object?)subject.Prerequisites ?? DBNull.Value));
            command.Parameters.Add(new OracleParameter("units", subject.Units));
            command.Parameters.Add(new OracleParameter("code", subject.Subject_Code));

            await connection.OpenAsync();
            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> DeleteSubjectAsync(string subjectCode)
        {
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand("DELETE FROM CAMPUS_ADMIN.SUBJECTS WHERE SUBJECT_CODE = :code", connection);
            command.Parameters.Add(new OracleParameter("code", subjectCode));

            await connection.OpenAsync();
            return await command.ExecuteNonQueryAsync() > 0;
        }
    }
}