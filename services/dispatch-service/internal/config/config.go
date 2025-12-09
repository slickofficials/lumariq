package config

import "os"

type Config struct {
    Port string
}

func New() *Config {
    port := os.Getenv("DISPATCH_HTTP_PORT")
    if port == "" {
        port = "8080"
    }

    return &Config{
        Port: port,
    }
}