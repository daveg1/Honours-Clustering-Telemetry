using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;

namespace ProcessView.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ViewerController : ControllerBase
    {
        private readonly IWebHostEnvironment Environment;

        /// <summary>
        /// Constructor with injected environment from hosting.
        /// </summary>
        /// <param name="environment">The environment.</param>
        public ViewerController(IWebHostEnvironment environment)
        {
            Environment = environment;
        }

        /// <summary>
        /// Rov data object for 3d client.
        /// </summary>
        public class RovCampaign
        {
            public double[] Positions { get; set; }
            public DateTime[] Times { get; set; }
            public int[] KPI { get; set; }
            public double[] Rolls { get; set; }
            public double[] Pitches { get; set; }
            public double[] Headings { get; set; }
        }

        /// <summary>
        /// Public endpoint for campaign data consumer.
        /// </summary>
        /// <returns>Converted campaign data (from etr file format).</returns>
        [HttpGet]
        public RovCampaign RovCampaignData()
        {
            RovTelemetry rovTelemetry = new();

            rovTelemetry.ProcessEtr();

            RovCampaign rovCampaign = new();
            rovCampaign.Times = rovTelemetry.Times;
            rovCampaign.Positions = rovTelemetry.Positions;
            rovCampaign.Rolls = rovTelemetry.Rolls;
            rovCampaign.Pitches = rovTelemetry.Pitches;
            rovCampaign.Headings = rovTelemetry.Headings;

            // Normalise (kind of).
            double maxInterval = 10000000;
            double tickDifference;
            rovCampaign.KPI = new int[rovCampaign.Times.Length];
            for (int i = 0; i < rovCampaign.Times.Length - 1; i++)
            {
                tickDifference = (rovCampaign.Times[i + 1].Ticks - rovCampaign.Times[i].Ticks);
                if (tickDifference >= maxInterval) { tickDifference = maxInterval; }
                rovCampaign.KPI[i] = (int)(255f * (tickDifference / maxInterval));
            }

            return rovCampaign;
        }
    }
}