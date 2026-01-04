package ws

type Hub struct {
	DriverLocations map[string]*Location
}

type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

var HubInstance = Hub{
	DriverLocations: make(map[string]*Location),
}