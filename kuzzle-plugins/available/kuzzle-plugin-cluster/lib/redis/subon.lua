--
-- Kuzzle, a backend software, self-hostable and ready to use
-- to power modern apps
--
-- Copyright 2015-2018 Kuzzle
-- mailto: support AT kuzzle.io
-- website: http://kuzzle.io
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
-- https://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.
--


local hash_tag = KEYS[1]

local node_id = ARGV[1]
local room_id = ARGV[2]
local connection_id = ARGV[3]
local in_filter_json = ARGV[4]

local count
local debug = {}

-- register filter
if in_filter_json ~= 'none' then
    table.insert(debug, 'inserting filter ' .. hash_tag .. room_id)
    redis.call('SET', 'cluster:filters:' .. hash_tag .. room_id, in_filter_json)
    redis.call('SADD', 'cluster:filters_tree' .. hash_tag, room_id)
end

-- attach client to room
redis.call('SADD', 'cluster:room_clients:'  .. hash_tag .. room_id, connection_id)
count = redis.call('SCARD', 'cluster:room_clients:' .. hash_tag .. room_id)
redis.call('SET', 'cluster:room_counts:' .. hash_tag .. room_id, count)

-- attach room to <node, client>
redis.call('SADD', 'cluster:node_clients:' .. hash_tag .. node_id, connection_id)
redis.call('SADD', 'cluster:client_rooms:' .. hash_tag .. connection_id, room_id)


local version = redis.call('INCR', 'cluster:version' .. hash_tag)
-- handle signed 64 bits overflows
if version >= 9223372036854775807 then
    version = 1
    redis.call('SET', 'cluster:version' .. hash_tag, version)
end

return {version, count, debug}