package server

import (
    "context"
    "log"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "go.uber.org/fx"

    "github.com/lumariq/dispatch-service/internal/config"
    "github.com/lumariq/dispatch-service/internal/routes"
)

func NewHTTPServer(cfg *config.Config) *http.Server {
    router := gin.New()
    router.Use(gin.Recovery())

    routes.Register(router)

    srv := &http.Server{
        Addr:    ":" + cfg.Port,
        Handler: router,
    }

    return srv
}

func Start(lc fx.Lifecycle, srv *http.Server) {
    lc.Append(fx.Hook{
        OnStart: func(ctx context.Context) error {
            go func() {
                log.Printf("dispatch-service listening on %s", srv.Addr)
                if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
                    log.Printf("http server error: %v", err)
                }
            }()
            return nil
        },
        OnStop: func(ctx context.Context) error {
            shutdownCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
            defer cancel()
            return srv.Shutdown(shutdownCtx)
        },
    })
}