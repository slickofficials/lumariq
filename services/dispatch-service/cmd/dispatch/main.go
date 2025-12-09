package main

import (
    "github.com/lumariq/dispatch-service/internal/config"
    "github.com/lumariq/dispatch-service/internal/server"
    "go.uber.org/fx"
)

func main() {
    app := fx.New(
        fx.Provide(
            config.New,
            server.NewHTTPServer,
        ),
        fx.Invoke(
            server.Start,
        ),
    )

    app.Run()
}