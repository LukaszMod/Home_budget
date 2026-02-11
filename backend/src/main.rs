use axum::Router;
use dotenvy::dotenv;
use std::net::SocketAddr;
use sqlx::postgres::PgPoolOptions;
use tracing_subscriber::{EnvFilter, fmt};
use tower_http::cors::{CorsLayer};
use tower_http::trace::TraceLayer;

mod models;
mod handlers;
mod routes;
mod utils;

#[derive(Clone)]
pub struct AppState {
    pool: sqlx::PgPool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let db_url = std::env::var("DATABASE_URL")?;
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await?;

    let state = AppState { pool };

    let app = Router::new()
        .merge(routes::router())
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http());

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse()
        .expect("PORT must be a valid u16");
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("Listening on http://{}", addr);

    axum::serve(listener, app).await?;
    Ok(())
}
