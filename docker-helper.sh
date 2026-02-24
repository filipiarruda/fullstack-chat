#!/bin/bash

# Fullstack Chat Docker Helper Script
# Usage: ./docker-helper.sh [command]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Commands
COMPOSE_CMD="docker-compose"

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Build images
build() {
    print_header "Building Docker Images"
    $COMPOSE_CMD build
    print_success "Images built successfully"
}

# Build without cache
build_nocache() {
    print_header "Building Docker Images (no cache)"
    $COMPOSE_CMD build --no-cache
    print_success "Images built successfully"
}

# Start containers
start() {
    print_header "Starting Containers"
    $COMPOSE_CMD up -d
    print_success "Containers started"
    print_info "Frontend:  http://localhost:3000"
    print_info "Backend:   http://localhost:3002"
    print_info "Swagger:   http://localhost:3002/docs"
}

# Start with logs
start_logs() {
    print_header "Starting Containers with Logs"
    $COMPOSE_CMD up
}

# Stop containers
stop() {
    print_header "Stopping Containers"
    $COMPOSE_CMD stop
    print_success "Containers stopped"
}

# Remove containers
down() {
    print_header "Removing Containers"
    $COMPOSE_CMD down
    print_success "Containers removed"
}

# Remove containers and volumes
down_volumes() {
    print_header "Removing Containers and Volumes"
    $COMPOSE_CMD down -v
    print_success "Containers and volumes removed"
}

# Show logs
logs() {
    service=$1
    if [ -z "$service" ]; then
        $COMPOSE_CMD logs -f
    else
        $COMPOSE_CMD logs -f "$service"
    fi
}

# Show status
ps() {
    print_header "Container Status"
    $COMPOSE_CMD ps
}

# Rebuild specific service
rebuild() {
    service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service: backend, frontend, or postgres"
        exit 1
    fi
    
    print_header "Rebuilding $service"
    $COMPOSE_CMD build "$service"
    $COMPOSE_CMD up -d "$service"
    print_success "$service rebuilt and restarted"
}

# Exec into container
shell() {
    service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service: backend or frontend"
        exit 1
    fi
    
    case $service in
        backend)
            docker exec -it fullstack-chat-backend sh
            ;;
        frontend)
            docker exec -it fullstack-chat-frontend sh
            ;;
        postgres)
            docker exec -it fullstack-chat-postgres psql -U chat_user -d chat_db
            ;;
        *)
            print_error "Unknown service: $service"
            exit 1
            ;;
    esac
}

# Restart service
restart() {
    service=$1
    if [ -z "$service" ]; then
        print_header "Restarting All Containers"
        $COMPOSE_CMD restart
    else
        print_header "Restarting $service"
        $COMPOSE_CMD restart "$service"
    fi
    print_success "Done"
}

# Show logs tail
tail_logs() {
    service=$1
    lines=${2:-100}
    
    if [ -z "$service" ]; then
        $COMPOSE_CMD logs --tail=$lines
    else
        $COMPOSE_CMD logs --tail=$lines "$service"
    fi
}

# Clean everything
clean() {
    print_header "Cleaning Up Everything"
    print_warning "This will remove all containers, volumes, and images"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        $COMPOSE_CMD down -v
        docker system prune -a
        print_success "Everything cleaned up"
    else
        print_info "Cleanup cancelled"
    fi
}

# Health check
health() {
    print_header "Health Check"
    
    # Backend
    if curl -s http://localhost:3002/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not responding"
    fi
    
    # Frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi
    
    # Database
    if docker exec fullstack-chat-postgres pg_isready -U chat_user &> /dev/null; then
        print_success "Database is healthy"
    else
        print_error "Database is not responding"
    fi
}

# Show help
show_help() {
    cat << EOF
${BLUE}Fullstack Chat - Docker Helper${NC}

Usage: ./docker-helper.sh [command] [options]

Commands:
    ${GREEN}build${NC}              Build Docker images
    ${GREEN}build-nocache${NC}      Build Docker images without cache
    ${GREEN}start${NC}              Start containers in background
    ${GREEN}start-logs${NC}         Start containers and attach logs
    ${GREEN}stop${NC}               Stop all containers
    ${GREEN}down${NC}               Remove all containers
    ${GREEN}down-volumes${NC}       Remove containers and volumes
    ${GREEN}ps${NC}                 Show container status
    ${GREEN}logs [service]${NC}     Show logs (service: all, backend, frontend, postgres)
    ${GREEN}tail [service] [n]${NC} Show last n lines of logs
    ${GREEN}shell [service]${NC}    Open shell in container
    ${GREEN}rebuild [service]${NC}  Rebuild and restart service
    ${GREEN}restart [service]${NC}  Restart containers
    ${GREEN}health${NC}             Check health of services
    ${GREEN}clean${NC}              Remove everything (use with caution)
    ${GREEN}help${NC}               Show this help message

Examples:
    ./docker-helper.sh build
    ./docker-helper.sh start
    ./docker-helper.sh logs backend
    ./docker-helper.sh shell backend
    ./docker-helper.sh rebuild frontend
    ./docker-helper.sh tail postgres 50

Environment:
    Frontend:     http://localhost:3000
    Backend:      http://localhost:3002
    Swagger Docs: http://localhost:3002/docs
    
${YELLOW}Note: Docker and Docker Compose must be installed${NC}
EOF
}

# Main
main() {
    command=$1
    
    case $command in
        build)
            check_docker
            build
            ;;
        build-nocache)
            check_docker
            build_nocache
            ;;
        start)
            check_docker
            start
            ;;
        start-logs)
            check_docker
            start_logs
            ;;
        stop)
            check_docker
            stop
            ;;
        down)
            check_docker
            down
            ;;
        down-volumes)
            check_docker
            down_volumes
            ;;
        ps)
            check_docker
            ps
            ;;
        logs)
            check_docker
            logs "$2"
            ;;
        tail)
            check_docker
            tail_logs "$2" "$3"
            ;;
        shell)
            check_docker
            shell "$2"
            ;;
        rebuild)
            check_docker
            rebuild "$2"
            ;;
        restart)
            check_docker
            restart "$2"
            ;;
        health)
            check_docker
            health
            ;;
        clean)
            check_docker
            clean
            ;;
        help|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
