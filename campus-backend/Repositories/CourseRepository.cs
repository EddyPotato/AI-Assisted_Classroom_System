using campus_backend.Models;
using Oracle.ManagedDataAccess.Client;

namespace campus_backend.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly string _connectionString;

        public CourseRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? configuration.GetConnectionString("OracleConnection")
                ?? configuration.GetConnectionString("OracleDb")
                ?? throw new InvalidOperationException("Connection string not found.");
        }

        public async Task<IEnumerable<Course>> GetAllCoursesAsync()
        {
            var courses = new List<Course>();
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand("SELECT * FROM CAMPUS_ADMIN.COURSES ORDER BY COURSE_CODE", connection);
            
            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                courses.Add(new Course
                {
                    Course_Code = reader["COURSE_CODE"].ToString()!,
                    Course_Name = reader["COURSE_NAME"].ToString()!,
                    Department = reader["DEPARTMENT"].ToString()!
                });
            }
            return courses;
        }

        public async Task<Course?> GetCourseByIdAsync(string courseCode)
        {
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand("SELECT * FROM CAMPUS_ADMIN.COURSES WHERE COURSE_CODE = :code", connection);
            command.Parameters.Add(new OracleParameter("code", courseCode));
            
            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Course
                {
                    Course_Code = reader["COURSE_CODE"].ToString()!,
                    Course_Name = reader["COURSE_NAME"].ToString()!,
                    Department = reader["DEPARTMENT"].ToString()!
                };
            }
            return null;
        }

        public async Task<bool> CreateCourseAsync(Course course)
        {
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand(
                "INSERT INTO CAMPUS_ADMIN.COURSES (COURSE_CODE, COURSE_NAME, DEPARTMENT) VALUES (:code, :name, :dept)", connection);
            
            command.Parameters.Add(new OracleParameter("code", course.Course_Code));
            command.Parameters.Add(new OracleParameter("name", course.Course_Name));
            command.Parameters.Add(new OracleParameter("dept", course.Department));

            await connection.OpenAsync();
            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> UpdateCourseAsync(Course course)
        {
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand(
                "UPDATE CAMPUS_ADMIN.COURSES SET COURSE_NAME = :name, DEPARTMENT = :dept WHERE COURSE_CODE = :code", connection);
            
            command.Parameters.Add(new OracleParameter("name", course.Course_Name));
            command.Parameters.Add(new OracleParameter("dept", course.Department));
            command.Parameters.Add(new OracleParameter("code", course.Course_Code));

            await connection.OpenAsync();
            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> DeleteCourseAsync(string courseCode)
        {
            using var connection = new OracleConnection(_connectionString);
            using var command = new OracleCommand("DELETE FROM CAMPUS_ADMIN.COURSES WHERE COURSE_CODE = :code", connection);
            command.Parameters.Add(new OracleParameter("code", courseCode));

            await connection.OpenAsync();
            return await command.ExecuteNonQueryAsync() > 0;
        }
    }
}