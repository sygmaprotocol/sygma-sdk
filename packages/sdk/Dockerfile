# Copyright 2020 ChainSafe Systems
# SPDX-License-Identifier: LGPL-3.0-only

FROM  golang:1.17-stretch AS builder
# ADD . /src
WORKDIR /src
# RUN cd /src && echo $(ls -1 /src)
RUN cd /src && git clone https://github.com/ChainSafe/chainbridge-core.git .
RUN ls -l /src
RUN go mod download
RUN go build -o /bridge ./e2e/evm-evm/example/.

# # final stage
FROM debian:stretch-slim
COPY config /config
# COPY keystore /keystore
COPY --from=builder /bridge ./
RUN chmod +x ./bridge
RUN ls -l
# RUN cat /config/config_evm-evm.json

ENTRYPOINT ["./bridge"]
