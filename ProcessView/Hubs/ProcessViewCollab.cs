using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ProcessView.Hubs
{
    public class ProcessViewCollab : Hub
    {
        // User class.
        public class User
        {
            public string ConnectionId { get; private set; }
            public string UserId { get; set; }
            public string[] AssetIds { get; set; }

            /// <summary>
            /// User constructor.
            /// </summary>
            /// <param name="ConnectionId">SignalR connection id.</param>
            /// <param name="UserId">Authenticated user.</param>
            public User(string ConnectionId, string UserId)
            {
                this.ConnectionId = ConnectionId;
                this.UserId = UserId;
            }
        }

        // User container.
        private static readonly List<User> Users = new() { };

        // Asset class.
        public class Asset
        {
            public string AssetId { get; set; }
            public string CloneOf { get; set; }
            public THREEv3 Position { get; set; }
            public THREEv3 Rotation { get; set; }
            public THREEv3 Scale { get; set; }

            public Asset()
            {
                Position = new THREEv3();
                Rotation = new THREEv3();
                Scale = new THREEv3();
            }
        }

        // THREE JS vector.
        public class THREEv3
        {
            public double x { get; set; }
            public double y { get; set; }
            public double z { get; set; }
        }

        // Asset container.
        private static List<Asset> Assets = new() { };

        // Transform class.
        public class Transform
        {
            public string AssetId { get; set; }
            public string CloneOf { get; set; }
            public long DateTime { get; set; }
            public THREEv3 Position { get; set; }
            public THREEv3 Rotation { get; set; }
            public THREEv3 Scale { get; set; }
        }

        // Transform container.
        public class TransFormContainer
        {
            public string Content { get; set; }
            public Transform Value { get; set; }
        }

        /// <summary>
        /// Send a message to all clients.
        /// </summary>
        /// <param name="user">The user.</param>
        /// <param name="message">The text message.</param>
        /// <returns>Task as message invocation.</returns>
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        /// <summary>
        /// A new user needs to have awareness of all other connected users.
        /// </summary>
        /// <param name="user">The new user.</param>
        /// <returns>Task as message invocation.</returns>
        public async Task GetUsers(string user)
        {
            for (int i = 0; i < Users.Count; i++)
            {
                if (Users[i].ConnectionId == Context.ConnectionId)
                {
                    if (Users[i].UserId == null) { Users[i].UserId = user; };
                    break;
                }
            }

            await Clients.Caller.SendAsync("ReceiveMessage", user, $"{{ \"content\": \"user\", \"value\": { JsonSerializer.Serialize(Users.Where(u => u.UserId != null).Select(i => i.UserId).ToArray()) } }}");
        }

        /// <summary>
        /// Old users needs to have awareness of new connected users.
        /// </summary>
        /// <param name="user">The new user.</param>
        /// <returns>Task as message invocation.</returns>
        public async Task SyncUsers(string user)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, $"{{ \"content\": \"users\", \"value\": { JsonSerializer.Serialize(Users.Where(u => u.UserId != null).Select(i => i.UserId).ToArray()) } }}");
        }

        /// <summary>
        /// Project owner / administrator sets unique identifiers for root objects.
        /// </summary>
        /// <param name="user">Owner or spectator.</param>
        /// <param name="assetCount">Number of default assets.</param>
        /// <returns>Task as message invocation.</returns>
        public async Task SetAssets(string user, string assets)
        {
            if (Users.Count == 1)
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                };

                Assets = JsonSerializer.Deserialize<List<Asset>>(assets, options);

                for (int i = 0; i < Assets.Count; i++)
                {
                    Assets[i].AssetId = Guid.NewGuid().ToString();
                }
            }

            await Clients.Caller.SendAsync("ReceiveMessage", user, $"{{ \"content\": \"assets\", \"value\": { JsonSerializer.Serialize(Assets) } }}");
        }

        /// <summary>
        /// Broadcasts a user transform operation to all users. Updates the root asset collection.
        /// </summary>
        /// <param name="user">Transmitting user.</param>
        /// <param name="message">Transform parameters.</param>
        /// <returns>Task as message invocation.</returns>
        public async Task TransformAsset(string user, string message)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            TransFormContainer transform = JsonSerializer.Deserialize<TransFormContainer>(message, options);
            Asset asset = Assets.Where(i => i.AssetId == transform.Value.AssetId).FirstOrDefault();

            switch (transform.Content)
            {
                case "transform":

                    if (asset != null)
                    {
                        asset.Position.x = transform.Value.Position.x;
                        asset.Position.y = transform.Value.Position.y;
                        asset.Position.z = transform.Value.Position.z;

                        asset.Rotation.x = transform.Value.Rotation.x;
                        asset.Rotation.y = transform.Value.Rotation.y;
                        asset.Rotation.z = transform.Value.Rotation.z;

                        asset.Scale.x = transform.Value.Scale.x;
                        asset.Scale.y = transform.Value.Scale.y;
                        asset.Scale.z = transform.Value.Scale.z;
                    }
                    break;

                case "clone":

                    Asset clonedAsset = new();
                    clonedAsset.AssetId = transform.Value.AssetId;
                    clonedAsset.CloneOf = transform.Value.CloneOf;

                    clonedAsset.Position.x = transform.Value.Position.x;
                    clonedAsset.Position.y = transform.Value.Position.y;
                    clonedAsset.Position.z = transform.Value.Position.z;

                    clonedAsset.Rotation.x = transform.Value.Rotation.x;
                    clonedAsset.Rotation.y = transform.Value.Rotation.y;
                    clonedAsset.Rotation.z = transform.Value.Rotation.z;

                    clonedAsset.Scale.x = transform.Value.Scale.x;
                    clonedAsset.Scale.y = transform.Value.Scale.y;
                    clonedAsset.Scale.z = transform.Value.Scale.z;

                    Assets.Add(clonedAsset);

                    break;

                case "delete":

                    if (asset != null)
                    {
                        asset.CloneOf = transform.Value.AssetId;

                        asset.Position.x = transform.Value.Position.x;
                        asset.Position.y = transform.Value.Position.y;
                        asset.Position.z = transform.Value.Position.z;

                        asset.Rotation.x = transform.Value.Rotation.x;
                        asset.Rotation.y = transform.Value.Rotation.y;
                        asset.Rotation.z = transform.Value.Rotation.z;

                        asset.Scale.x = transform.Value.Scale.x;
                        asset.Scale.y = transform.Value.Scale.y;
                        asset.Scale.z = transform.Value.Scale.z;
                    }

                    break;

                default:
                    break;
            }

            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        /// <summary>
        /// Request the state of the root user.
        /// </summary>
        /// <param name="user">Requesting user.</param>
        /// <returns>Task as message invocation.</returns>
        public async Task GetRootState(string user)
        {
            await Clients.Client(Users[0].ConnectionId).SendAsync("ReceiveMessage", user, "{ \"content\": \"rootstate\", \"value\": \"post\" }");
        }

        /// <summary>
        /// Sends the asset state to new user.
        /// </summary>
        /// <param name="user">New user.</param>
        /// <param name="state">Root user state.</param>
        /// <returns>Task as message invocation.</returns>
        public async Task SetRootState(string user, string state)
        {
            await Clients.Client(Users.Where(i => i.UserId == user).FirstOrDefault().ConnectionId).SendAsync("ReceiveMessage", user, $"{{ \"content\": \"assetstate\", \"value\": { state } }}");
        }

        /// <summary>
        /// When connection is establishedm send a message to the client.
        /// </summary>
        /// <returns>Base class event of SignalR Hub.</returns>
        public override Task OnConnectedAsync()
        {
            Clients.Caller.SendAsync("ReceiveMessage", Context.ConnectionId, "{ \"content\": \"status\", \"value\": \"connected\" }");
            Users.Add(new User(Context.ConnectionId, null));

            if (Users.Count > 1)
            {
                double millis = DateTime.Now.ToUniversalTime().Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;

                Clients.All.SendAsync("ReceiveMessage", Context.ConnectionId, $"{{ \"content\": \"time\", \"value\": \"{ millis }\" }}");
            }

            return base.OnConnectedAsync();
        }

        /// <summary>
        /// Disconnection event handler. Removes user from Users.
        /// </summary>
        /// <param name="exception">Disconnection exception.</param>
        /// <returns>Base class event of SignalR Hub.</returns>
        public override Task OnDisconnectedAsync(Exception exception)
        {
            for (int i = Users.Count - 1; i > -1; i--)
            {
                if (Context.ConnectionId == Users[i].ConnectionId)
                {
                    Clients.All.SendAsync("ReceiveMessage", Users[i].UserId, "{ \"content\": \"status\", \"value\": \"disconnected\" }");
                    Users.RemoveAt(i);
                }
            }

            return base.OnDisconnectedAsync(exception);
        }
    }
}
