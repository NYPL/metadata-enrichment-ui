Rails.application.routes.draw do

  get 'people' => 'people#index', :as => :people
  get 'image/proxy' => 'image#proxy', :as => :imageproxy
  get 'nyplapi/search' => 'nyplapi#search', :as => :search
  get 'nyplapi/item/:id' => 'nyplapi#item', :as => :item

  root 'home#index'
end
