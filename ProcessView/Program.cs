using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace ProcessView
{
    public class Program
    {
        /// <summary>
        /// Enrty point of the application.
        /// </summary>
        /// <param name="args">User arguments.</param>
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        /// <summary>
        /// Start the host.
        /// </summary>
        /// <param name="args">User arguments.</param>
        /// <returns>Interface to the host builder.</returns>
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
